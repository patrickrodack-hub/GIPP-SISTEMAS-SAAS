import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal, Database, HelpCircle, Calculator, Monitor,
  Folder, ArrowLeft, RefreshCw, X, Play, Square,
  Layers, HardDrive, Check, Volume2, VolumeX,
  Maximize2, Minimize2, ChevronRight, Hash, LogOut, Lock
} from 'lucide-react';

interface ClipperLayoutProps {
  view: string;
  setView: (v: string) => void;
  user: any;
  db: any;
  mMeta: any;
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
  addToast?: (msg: string, type?: any) => void;
}

export const ClipperLayout: React.FC<ClipperLayoutProps> = ({
  view,
  setView,
  user,
  db,
  mMeta,
  isModuleAllowed,
  CurrentModule,
  currentProps,
  handleLogoutRequest,
  setIsScreenLocked,
  osTheme,
  setOsTheme,
  ALL_AVAILABLE_MODULES,
  addToast = (_msg: string = '', _type: any = 'info') => {}
}) => {
  // Navigation & Menus
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Modals & Panels
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDotPrompt, setShowDotPrompt] = useState(false);
  const [showDbfViewer, setShowDbfViewer] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAlertLogout, setShowAlertLogout] = useState(false);
  const [showModulesCatalog, setShowModulesCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  
  // Window controls
  const [isWindowMaximized, setIsWindowMaximized] = useState(true);
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);
  
  // Audio synthesizer for classic PC Speaker
  const audioContextRef = useRef<AudioContext | null>(null);

  const playPcSpeaker = (freq = 800, duration = 0.05, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const playMenuSound = () => playPcSpeaker(950, 0.04, 'square');
  const playSelectSound = () => playPcSpeaker(600, 0.08, 'square');
  const playAlertSound = () => {
    playPcSpeaker(300, 0.1, 'square');
    setTimeout(() => playPcSpeaker(200, 0.15, 'square'), 110);
  };
  const playKeyClick = () => playPcSpeaker(1200, 0.02, 'triangle');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('pt-BR'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Function Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        playAlertSound();
        setShowHelpDialog(prev => !prev);
      } else if (e.key === 'F2') {
        e.preventDefault();
        playSelectSound();
        addToast("Comando GRAVAR acionado (F2)", "info");
      } else if (e.key === 'F3') {
        e.preventDefault();
        playMenuSound();
        setShowModulesCatalog(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        playMenuSound();
        setShowModulesCatalog(prev => !prev);
      } else if (e.key === 'F5') {
        e.preventDefault();
        playSelectSound();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      } else if (e.key === 'F6') {
        e.preventDefault();
        playMenuSound();
        setShowThemePicker(prev => !prev);
      } else if (e.key === 'F7') {
        e.preventDefault();
        playMenuSound();
        setShowCalculator(prev => !prev);
      } else if (e.key === 'F8') {
        e.preventDefault();
        playMenuSound();
        setShowDotPrompt(prev => !prev);
      } else if (e.key === 'F9') {
        e.preventDefault();
        playMenuSound();
        setShowDbfViewer(prev => !prev);
      } else if (e.key === 'F10') {
        e.preventDefault();
        playMenuSound();
        setActiveMenu(prev => prev ? null : 'sistema');
      } else if (e.key === 'Escape') {
        if (activeMenu) {
          e.preventDefault();
          playKeyClick();
          setActiveMenu(null);
        } else if (showCalculator || showDotPrompt || showDbfViewer || showHelpDialog || showThemePicker || showModulesCatalog) {
          e.preventDefault();
          playKeyClick();
          setShowCalculator(false);
          setShowDotPrompt(false);
          setShowDbfViewer(false);
          setShowHelpDialog(false);
          setShowThemePicker(false);
          setShowModulesCatalog(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenu, showCalculator, showDotPrompt, showDbfViewer, showHelpDialog, showThemePicker, showModulesCatalog]);

  // Dot prompt state
  const [dotInput, setDotInput] = useState('');
  const [dotHistory, setDotHistory] = useState<string[]>([
    "GIPP SISTEMAS INTEGRADOS - COMPILADOR CA-CLIPPER (R) 5.3b",
    "Versao de Sistema 2026.09 - Modo de Compatibilidade Ativo",
    "Digite 'HELP' para lista de comandos ou 'DIR' para arquivos DBF.",
    ""
  ]);

  const handleDotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = dotInput.trim().toUpperCase();
    if (!cmd) return;
    playKeyClick();
    
    const newHistory = [...dotHistory, `.${cmd}`];
    
    if (cmd === 'HELP') {
      newHistory.push("COMANDOS DISPONIVEIS NO GIPP CLIPPER:");
      newHistory.push("  DIR         - Lista arquivos de banco de dados (.DBF, .NTX)");
      newHistory.push("  USE <NOME>  - Abre módulo especifico (ex: USE MEMBROS)");
      newHistory.push("  MEMBROS     - Acessa o Cadastro Geral de Membros");
      newHistory.push("  FINANCEIRO  - Acessa Módulo Financeiro");
      newHistory.push("  EBD         - Acessa Escola Bíblica Dominical");
      newHistory.push("  TEOLOGIA    - Acessa Universidade Teológica");
      newHistory.push("  VISITANTES  - Acessa Módulo de Visitantes");
      newHistory.push("  VER         - Exibe informações da versão CA-Clipper");
      newHistory.push("  CLS / CLEAR - Limpa o terminal");
      newHistory.push("  CALC        - Abre a calculadora auxiliar");
      newHistory.push("  STATUS      - Exibe status da memória e dos índices");
      newHistory.push("  QUIT / EXIT - Fecha a janela do terminal");
    } else if (cmd === 'DIR') {
      newHistory.push("Nome do Arquivo       Tam (Bytes)    Data       Hora");
      newHistory.push("-------------------   ------------   ---------- --------");
      newHistory.push("MEMBROS.DBF               481.280    03/09/2026 18:40:12");
      newHistory.push("MEM01.NTX                 112.640    03/09/2026 18:40:12");
      newHistory.push("CONGREG.DBF                98.304    03/09/2026 17:15:00");
      newHistory.push("FINENTR.DBF               742.400    03/09/2026 18:50:44");
      newHistory.push("FINSAID.DBF               315.392    03/09/2026 18:50:44");
      newHistory.push("EBDALUN.DBF               180.224    03/09/2026 16:30:20");
      newHistory.push("EBDPROF.DBF                45.056    03/09/2026 16:30:20");
      newHistory.push("GIPP53.EXE              1.420.288    01/08/2026 12:00:00");
      newHistory.push("   8 Arquivo(s)      3.395.584 bytes");
      newHistory.push("   Espaço Livre:    14.280.960 bytes");
    } else if (cmd === 'CLS' || cmd === 'CLEAR') {
      setDotHistory([""]);
      setDotInput('');
      return;
    } else if (cmd === 'VER') {
      newHistory.push("CA-Clipper (R) 5.3b (Rev. 338) (c) 1985-1996 Computer Associates Intl.");
      newHistory.push("GIPP Core Version 2026.4 - DBase III Plus / Clipper 5.x Engine");
    } else if (cmd === 'STATUS') {
      newHistory.push("STATUS DO SISTEMA:");
      newHistory.push(`  Base: ${db?.igreja?.nome || 'GIPP Igreja Local'}`);
      newHistory.push("  Área de Trabalho Ativa: 1 (MEMBROS)");
      newHistory.push("  Índice Master: MEM01.NTX (TAG: NOME)");
      newHistory.push("  SET EXACT: ON  |  SET DELETED: ON  |  SET BELL: ON");
      newHistory.push("  Memória Convencional Livre: 584.320 bytes");
    } else if (cmd === 'CALC') {
      setShowCalculator(true);
      newHistory.push("Calculadora Clipper inicializada.");
    } else if (cmd === 'MEMBROS' || cmd === 'USE MEMBROS') {
      setView('cad_membro');
      newHistory.push("Abrindo MEMBROS.DBF...");
    } else if (cmd === 'FINANCEIRO' || cmd === 'USE FINANCEIRO') {
      setView('fin_entrada');
      newHistory.push("Abrindo FINENTR.DBF...");
    } else if (cmd === 'EBD' || cmd === 'USE EBD') {
      setView('secretaria_ebd');
      newHistory.push("Abrindo EBDALUN.DBF...");
    } else if (cmd === 'TEOLOGIA' || cmd === 'USE TEOLOGIA') {
      setView('curso_teologia');
      newHistory.push("Abrindo TEOLOGIA.DBF...");
    } else if (cmd === 'VISITANTES' || cmd === 'USE VISITANTES') {
      setView('visitantes');
      newHistory.push("Abrindo VISITANT.DBF...");
    } else if (cmd === 'QUIT' || cmd === 'EXIT') {
      setShowDotPrompt(false);
    } else {
      newHistory.push(`Sintaxe incorreta: '${cmd}'. Digite 'HELP' para auxilio.`);
    }

    setDotHistory(newHistory);
    setDotInput('');
  };

  // Calculator logic
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcMemory, setCalcMemory] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcClearNext, setCalcClearNext] = useState(false);

  const handleCalcNumber = (num: string) => {
    playKeyClick();
    if (calcDisplay === '0' || calcClearNext) {
      setCalcDisplay(num);
      setCalcClearNext(false);
    } else {
      setCalcDisplay(calcDisplay + num);
    }
  };

  const handleCalcOp = (op: string) => {
    playKeyClick();
    const current = parseFloat(calcDisplay);
    if (calcMemory !== null && calcOp) {
      let res = calcMemory;
      if (calcOp === '+') res = calcMemory + current;
      if (calcOp === '-') res = calcMemory - current;
      if (calcOp === '*') res = calcMemory * current;
      if (calcOp === '/') res = current !== 0 ? calcMemory / current : 0;
      setCalcDisplay(String(res));
      setCalcMemory(res);
    } else {
      setCalcMemory(current);
    }
    setCalcOp(op);
    setCalcClearNext(true);
  };

  const handleCalcEquals = () => {
    playSelectSound();
    if (calcMemory === null || !calcOp) return;
    const current = parseFloat(calcDisplay);
    let res = calcMemory;
    if (calcOp === '+') res = calcMemory + current;
    if (calcOp === '-') res = calcMemory - current;
    if (calcOp === '*') res = calcMemory * current;
    if (calcOp === '/') res = current !== 0 ? calcMemory / current : 0;
    setCalcDisplay(String(res));
    setCalcMemory(null);
    setCalcOp(null);
    setCalcClearNext(true);
  };

  const handleCalcClear = () => {
    playKeyClick();
    setCalcDisplay('0');
    setCalcMemory(null);
    setCalcOp(null);
    setCalcClearNext(false);
  };

  // Menu Definition
  const menuCategories = [
    {
      id: 'sistema',
      label: '≡ Sistema',
      hotkey: 'S',
      items: [
        { label: 'Informações do Terminal Clipper', action: () => { setShowHelpDialog(true); } },
        { label: 'Calculadora Auxiliar [F7]', action: () => { setShowCalculator(true); } },
        { label: 'Linha de Comando DOT PROMPT [F8]', action: () => { setShowDotPrompt(true); } },
        { label: 'Gerenciador de Arquivos DBF [F9]', action: () => { setShowDbfViewer(true); } },
        { separator: true },
        { label: 'Alternar Som PC Speaker', action: () => { setSoundEnabled(!soundEnabled); addToast(soundEnabled ? "Som desativado" : "Som ativado", "info"); } },
        { label: 'Trocar Tema do Sistema [F6]', action: () => { setShowThemePicker(true); } },
        { label: 'Bloquear Terminal', action: () => { setIsScreenLocked(true); } },
        { separator: true },
        { label: 'Encerrar Sessão / DOS Prompt [ESC]', action: () => { setShowAlertLogout(true); } }
      ]
    },
    {
      id: 'cadastros',
      label: 'Cadastros',
      hotkey: 'C',
      items: [
        { id: 'cad_membro', label: '1. Cadastro de Membros' },
        { id: 'visitantes', label: '2. Registro de Visitantes' },
        { id: 'cad_igreja', label: '3. Sedes e Congregações' },
        { id: 'secretaria_ebd', label: '4. Alunos e Classes EBD' },
        { id: 'patrimonio', label: '5. Controle Patrimonial' },
        { id: 'patrocinadores', label: '6. Patrocinadores e Apoio' }
      ]
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      hotkey: 'F',
      items: [
        { id: 'fin_entrada', label: '1. Entradas e Dízimos (Caixa)' },
        { id: 'fin_saidas', label: '2. Saídas e Despesas' },
        { id: 'fin_prestacao_contas', label: '3. Prestação de Contas' },
        { id: 'fin_conciliacao', label: '4. Conciliação Bancária' },
        { id: 'fin_orcamento', label: '5. Orçamento Anual' },
        { id: 'dp_contabilidade', label: '6. Contabilidade & Balanço' }
      ]
    },
    {
      id: 'ensino',
      label: 'Ensino',
      hotkey: 'E',
      items: [
        { id: 'curso_teologia', label: '1. Universidade Teológica' },
        { id: 'formacao_obreiros', label: '2. Formação de Obreiros' },
        { id: 'gestao_cursos', label: '3. Gerenciamento de Cursos' },
        { id: 'biblia', label: '4. Bíblia Sagrada (Estudo)' },
        { id: 'discipulado', label: '5. Discipulado de Novos' }
      ]
    },
    {
      id: 'ministerios',
      label: 'Ministérios',
      hotkey: 'M',
      items: [
        { id: 'ministerio_louvor', label: '1. Ministério de Louvor' },
        { id: 'ministerio_midia', label: '2. Comunicação e Mídia' },
        { id: 'ministerio_familia', label: '3. Ministério da Família' },
        { id: 'missoes', label: '4. Secretaria de Missões' },
        { id: 'assistencia_social', label: '5. Assistência Social' }
      ]
    },
    {
      id: 'secretaria',
      label: 'Secretaria',
      hotkey: 'T',
      items: [
        { id: 'sec_livro_atas', label: '1. Livro Oficial de Atas' },
        { id: 'sec_certificados', label: '2. Emissão de Certificados' },
        { id: 'carteirinha_studio', label: '3. Carteirinhas de Membros' },
        { id: 'sec_agenda', label: '4. Agenda Eclesiástica' },
        { id: 'notificacoes_sistema', label: '5. Avisos e Circulares' }
      ]
    },
    {
      id: 'utilitarios',
      label: 'Utilitários',
      hotkey: 'U',
      items: [
        { id: 'assistente_ai', label: '1. Assistente Inteligente (IA)' },
        { id: 'docs_editor', label: '2. Editor de Textos Clipper' },
        { id: 'sheets_editor', label: '3. Planilhas de Cálculo' },
        { id: 'auditoria', label: '4. Trilha de Auditoria (LOG)' },
        { id: 'suporte_dev', label: '5. Suporte ao Desenvolvedor' }
      ]
    },
    {
      id: 'ajuda',
      label: 'Ajuda',
      hotkey: 'A',
      items: [
        { label: 'Manual do Usuário Clipper [F1]', action: () => { setShowHelpDialog(true); } },
        { label: 'Mapa de Teclas de Função', action: () => { setShowHelpDialog(true); } },
        { separator: true },
        { label: 'Sobre o GIPP CA-Clipper 5.3', action: () => { setShowHelpDialog(true); } }
      ]
    }
  ];

  // Filtered available modules for F4 / Catalog
  const filteredModules = useMemo(() => {
    return ALL_AVAILABLE_MODULES.filter(m => {
      if (!isModuleAllowed(m.id)) return false;
      if (!catalogSearch) return true;
      return m.label.toLowerCase().includes(catalogSearch.toLowerCase()) || 
             m.id.toLowerCase().includes(catalogSearch.toLowerCase());
    });
  }, [ALL_AVAILABLE_MODULES, isModuleAllowed, catalogSearch]);

  return (
    <div className="w-screen h-screen bg-[#0000aa] text-white font-mono overflow-hidden select-none flex flex-col relative text-[13px]">
      
      {/* ============================================================ */}
      {/* 1. CLIPPER ROW 0: TOP MENU BAR */}
      {/* ============================================================ */}
      <header className="h-7 bg-[#aaaaaa] text-black flex items-center justify-between px-2 text-[12px] font-bold border-b-2 border-black shrink-0 relative z-30">
        <div className="flex items-center gap-0.5">
          {menuCategories.map(cat => {
            const isOpen = activeMenu === cat.id;
            return (
              <div key={cat.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    playMenuSound();
                    setActiveMenu(isOpen ? null : cat.id);
                  }}
                  className={`px-2 py-0.5 cursor-pointer uppercase transition-none flex items-center gap-1 ${
                    isOpen 
                      ? 'bg-[#0000aa] text-[#ffff55] border-x border-t border-black' 
                      : 'hover:bg-[#00aaaa] hover:text-black text-black'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>

                {/* Dropdown Menu (Classic double ASCII frame & solid black shadow) */}
                {isOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => {
                        playKeyClick();
                        setActiveMenu(null);
                      }} 
                    />
                    <div className="absolute top-full left-0 mt-0 w-64 bg-[#0000aa] text-white border-2 border-white shadow-[6px_6px_0px_#000000] z-50 py-1 text-[12px]">
                      {cat.items.map((item: any, idx: number) => {
                        if (item.separator) {
                          return (
                            <div key={idx} className="border-t border-dashed border-[#55ffff]/50 my-1 mx-2" />
                          );
                        }
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              playSelectSound();
                              setActiveMenu(null);
                              if (item.action) {
                                item.action();
                              } else if (item.id) {
                                setView(item.id);
                                setIsWindowMinimized(false);
                              }
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-[#00aaaa] hover:text-black text-white flex items-center justify-between font-mono cursor-pointer transition-none group"
                          >
                            <span className="truncate">{item.label}</span>
                            <span className="text-[10px] text-[#55ffff] group-hover:text-black font-bold">►</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* System Info, Sound & Clock */}
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSelectSound();
            }}
            className="hover:bg-black/10 px-1 py-0.5 rounded cursor-pointer flex items-center gap-1"
            title={soundEnabled ? "Desativar som do PC Speaker" : "Ativar som do PC Speaker"}
          >
            {soundEnabled ? <Volume2 size={13} className="text-[#0000aa]" /> : <VolumeX size={13} className="text-red-700" />}
            <span className="hidden sm:inline">{soundEnabled ? "BEEP:ON" : "BEEP:OFF"}</span>
          </button>

          <span className="text-black/60 hidden md:inline">|</span>
          <span className="text-[#0000aa] font-black hidden md:inline">MEM: 584KB</span>
          <span className="text-black/60 hidden md:inline">|</span>
          <span className="text-black font-mono">{currentDate}</span>
          <span className="bg-black text-[#ffff55] px-1.5 py-0.2 font-mono tracking-wider">{currentTime}</span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. CLIPPER WORKSPACE / MAIN WINDOW CANVAS */}
      {/* ============================================================ */}
      <main className="flex-1 p-2 md:p-3 flex flex-col min-h-0 relative overflow-hidden bg-[#0000aa]">
        
        {/* Background ASCII watermark pattern for authentic DOS vibes */}
        <div className="absolute inset-0 pointer-events-none opacity-5 font-mono text-[10px] leading-tight select-none overflow-hidden text-white">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i}>
              ░▒▓ CA-CLIPPER (R) SUMMER '87 / 5.3b ▓▒░ GIPP SISTEMAS ECLESIASTICOS ░▒▓ DATABASE ENGINE ░▒▓ DBASE III PLUS ░▒▓
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/* ACTIVE MODULE WINDOW (Classic Double-border ASCII frame) */}
        {/* ============================================================ */}
        <div className={`flex-1 flex flex-col bg-[#0000aa] border-2 border-white shadow-[8px_8px_0px_#000000] relative z-10 min-h-0 ${
          isWindowMinimized ? 'hidden' : ''
        }`}>
          
          {/* Window Title Bar */}
          <div className="bg-[#00aaaa] text-black px-2 py-0.5 flex items-center justify-between font-bold border-b-2 border-white select-none shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-black text-white px-1 text-[11px] font-black">[■]</span>
              <span className="truncate uppercase tracking-wider text-[12px]">
                {mMeta?.label || 'GIPP SISTEMAS INTEGRADOS'} - [TABELA ATIVA: {view.toUpperCase()}.DBF]
              </span>
            </div>

            {/* Window control buttons */}
            <div className="flex items-center gap-1 shrink-0 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  setIsWindowMinimized(true);
                }}
                className="px-1.5 bg-black text-white hover:bg-white hover:text-black font-bold cursor-pointer"
                title="Minimizar formulário"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => {
                  playKeyClick();
                  setIsWindowMaximized(!isWindowMaximized);
                }}
                className="px-1.5 bg-black text-white hover:bg-white hover:text-black font-bold cursor-pointer"
                title="Maximizar formulário"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => {
                  playAlertSound();
                  setView('dashboard');
                }}
                className="px-1.5 bg-red-700 text-white hover:bg-white hover:text-red-700 font-bold cursor-pointer"
                title="Retornar ao Painel Geral"
              >
                X
              </button>
            </div>
          </div>

          {/* Sub-header / Status Indicator Row inside Window */}
          <div className="bg-[#000080] text-[#55ffff] px-3 py-1 border-b border-dashed border-[#55ffff]/40 flex items-center justify-between text-[11px] shrink-0 font-bold">
            <div className="flex items-center gap-3">
              <span>ORDEM: INDICE_01.NTX</span>
              <span className="opacity-50">│</span>
              <span>REG: 00124/00124</span>
              <span className="opacity-50">│</span>
              <span className="text-[#ffff55]">STATUS: GRAVADO</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white">OPERADOR: {user?.nome || user?.usuario || 'SUPERVISOR'}</span>
              <span className="opacity-50">│</span>
              <span className="bg-[#00aaaa] text-black px-1">DBF MODE</span>
            </div>
          </div>

          {/* Module Content Body with Clipper High-Contrast Styling Wrapper */}
          <div className="flex-1 overflow-auto p-2 bg-[#0000aa] text-white custom-scrollbar clipper-content-wrapper">
            <div className="max-w-7xl mx-auto">
              <CurrentModule {...currentProps} />
            </div>
          </div>

          {/* Window Footer Status / Prompt Row */}
          <div className="bg-[#000080] text-white px-3 py-0.5 border-t-2 border-white flex items-center justify-between text-[11px] shrink-0">
            <span className="text-[#ffff55] font-bold">
              [ENTER] Confirma  [ESC] Cancela  [F2] Grava  [F3] Localiza  [TAB] Próximo Campo
            </span>
            <span className="text-[#55ffff] font-mono">
              SET BELL ON | EXACT ON
            </span>
          </div>
        </div>

        {/* Minimized Window Indicator if minimized */}
        {isWindowMinimized && (
          <div className="m-auto text-center border-2 border-dashed border-white p-8 bg-[#000080] shadow-[8px_8px_0px_#000000] z-20">
            <h2 className="text-[#ffff55] text-lg font-bold mb-2">JANELA MINIMIZADA</h2>
            <p className="text-white text-xs mb-4">O formulário '{mMeta?.label}' está em segundo plano.</p>
            <button
              onClick={() => {
                playSelectSound();
                setIsWindowMinimized(false);
              }}
              className="bg-[#00aaaa] text-black font-black px-4 py-1.5 border-2 border-white hover:bg-white hover:text-black uppercase cursor-pointer"
            >
              &lt; RESTAURAR FORMULÁRIO [ENTER] &gt;
            </button>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 3. CLIPPER ROW 24/25: FUNCTION KEYS STATUS BAR */}
      {/* ============================================================ */}
      <footer className="bg-[#aaaaaa] text-black border-t-2 border-black flex items-center justify-between px-1 text-[11px] font-bold shrink-0 z-30 overflow-x-auto select-none py-0.5">
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => { playMenuSound(); setShowHelpDialog(true); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F1</span> Ajuda
          </button>
          <button
            onClick={() => { playSelectSound(); addToast("Dados gravados com sucesso! (F2)", "success"); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F2</span> Salvar
          </button>
          <button
            onClick={() => { playMenuSound(); setShowModulesCatalog(true); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F3</span> Buscar
          </button>
          <button
            onClick={() => { playMenuSound(); setShowModulesCatalog(!showModulesCatalog); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F4</span> Módulos
          </button>
          <button
            onClick={() => {
              playSelectSound();
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.().catch(() => {});
              } else {
                document.exitFullscreen?.().catch(() => {});
              }
            }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F5</span> Tela
          </button>
          <button
            onClick={() => { playMenuSound(); setShowThemePicker(true); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F6</span> Temas
          </button>
          <button
            onClick={() => { playMenuSound(); setShowCalculator(!showCalculator); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F7</span> Calc
          </button>
          <button
            onClick={() => { playMenuSound(); setShowDotPrompt(!showDotPrompt); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F8</span> Prompt
          </button>
          <button
            onClick={() => { playMenuSound(); setShowDbfViewer(!showDbfViewer); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F9</span> DBF
          </button>
          <button
            onClick={() => { playMenuSound(); setActiveMenu(activeMenu ? null : 'sistema'); }}
            className="px-2 py-0.5 bg-black text-white hover:bg-[#0000aa] hover:text-[#ffff55] border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">F10</span> Menu
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { playAlertSound(); setShowAlertLogout(true); }}
            className="px-2 py-0.5 bg-red-800 text-white hover:bg-white hover:text-red-800 border border-black cursor-pointer uppercase flex items-center gap-1"
          >
            <span className="text-[#ffff55]">ESC</span> Sair
          </button>
          <span className="bg-black text-[#55ffff] px-2 py-0.5 font-black hidden lg:inline">
            CA-CLIPPER 5.3
          </span>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 4. CLIPPER RETRO CALCULATOR MODAL (F7) */}
      {/* ============================================================ */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-none p-4">
          <div className="w-80 bg-[#0000aa] border-4 border-white shadow-[10px_10px_0px_#000000] p-1 font-mono">
            {/* Header */}
            <div className="bg-[#00aaaa] text-black px-2 py-1 flex items-center justify-between font-bold border-b-2 border-white">
              <span>╔══[ CALCULADORA CLIPPER ]══╗</span>
              <button
                onClick={() => { playKeyClick(); setShowCalculator(false); }}
                className="bg-black text-white px-1.5 hover:bg-white hover:text-black font-bold"
              >
                X
              </button>
            </div>

            {/* Display */}
            <div className="p-3">
              <div className="bg-black text-[#00ff00] p-2 text-right text-xl font-bold font-mono border-2 border-white tracking-widest overflow-hidden mb-3">
                {calcDisplay}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-1 text-center font-bold">
                <button onClick={handleCalcClear} className="col-span-2 bg-red-700 text-white p-2 border border-white hover:bg-white hover:text-red-700">&lt; C / CE &gt;</button>
                <button onClick={() => handleCalcOp('/')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">/</button>
                <button onClick={() => handleCalcOp('*')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">*</button>

                <button onClick={() => handleCalcNumber('7')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">7</button>
                <button onClick={() => handleCalcNumber('8')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">8</button>
                <button onClick={() => handleCalcNumber('9')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">9</button>
                <button onClick={() => handleCalcOp('-')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">-</button>

                <button onClick={() => handleCalcNumber('4')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">4</button>
                <button onClick={() => handleCalcNumber('5')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">5</button>
                <button onClick={() => handleCalcNumber('6')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">6</button>
                <button onClick={() => handleCalcOp('+')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">+</button>

                <button onClick={() => handleCalcNumber('1')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">1</button>
                <button onClick={() => handleCalcNumber('2')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">2</button>
                <button onClick={() => handleCalcNumber('3')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">3</button>
                <button onClick={handleCalcEquals} className="row-span-2 bg-[#00aaaa] text-black p-2 border border-white hover:bg-white hover:text-black flex items-center justify-center font-black">=</button>

                <button onClick={() => handleCalcNumber('0')} className="col-span-2 bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">0</button>
                <button onClick={() => handleCalcNumber('.')} className="bg-[#000080] text-white p-2 border border-white hover:bg-[#00aaaa] hover:text-black">.</button>
              </div>
            </div>
            
            <div className="bg-[#000080] text-[#ffff55] text-[10px] text-center py-1 border-t border-white">
              [ESC] FECHAR CALCULADORA
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. CLIPPER DOT PROMPT TERMINAL (F8) */}
      {/* ============================================================ */}
      {showDotPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl bg-black border-4 border-white shadow-[12px_12px_0px_#000000] p-1 font-mono text-white text-[12px]">
            {/* Terminal Header */}
            <div className="bg-[#00aaaa] text-black px-3 py-1 flex items-center justify-between font-bold border-b-2 border-white">
              <span>C:\GIPP&gt; COMMAND.COM - CLIPPER INTERPRETER</span>
              <button
                onClick={() => { playKeyClick(); setShowDotPrompt(false); }}
                className="bg-black text-white px-1.5 hover:bg-white hover:text-black font-bold"
              >
                X
              </button>
            </div>

            {/* Terminal Screen */}
            <div className="p-3 h-80 overflow-y-auto custom-scrollbar flex flex-col justify-end bg-black text-[#00ff00]">
              <div className="space-y-0.5">
                {dotHistory.map((line, idx) => (
                  <div key={idx} className="leading-tight font-mono">{line}</div>
                ))}
              </div>
              
              {/* Prompt Input Form */}
              <form onSubmit={handleDotSubmit} className="flex items-center gap-1 mt-2 text-white border-t border-green-700/50 pt-1">
                <span className="text-[#ffff55] font-bold">.</span>
                <input
                  type="text"
                  value={dotInput}
                  onChange={(e) => setDotInput(e.target.value)}
                  className="flex-1 bg-transparent text-[#00ff00] outline-none font-mono text-[12px] uppercase caret-white"
                  autoFocus
                  placeholder="DIGITE UM COMANDO (ex: HELP, DIR, USE MEMBROS)..."
                />
              </form>
            </div>

            <div className="bg-[#000080] text-white p-1 text-[11px] flex justify-between border-t border-white">
              <span>Pressione [ESC] ou digite 'QUIT' para fechar</span>
              <span className="text-[#ffff55]">MEMORIA LIVRE: 584K</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. CLIPPER DBF VIEWER MODAL (F9) */}
      {/* ============================================================ */}
      {showDbfViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl bg-[#0000aa] border-4 border-white shadow-[12px_12px_0px_#000000] p-1 font-mono text-[12px]">
            <div className="bg-[#00aaaa] text-black px-3 py-1 flex items-center justify-between font-bold border-b-2 border-white">
              <span>GERENCIADOR DE ARQUIVOS DE DADOS DBASE / CLIPPER (.DBF)</span>
              <button
                onClick={() => { playKeyClick(); setShowDbfViewer(false); }}
                className="bg-black text-white px-1.5 hover:bg-white hover:text-black font-bold"
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="border-2 border-white p-2 bg-[#000080]">
                <div className="text-[#ffff55] font-bold mb-2 uppercase">ESTRUTURA DE TABELAS ATIVAS NO DIRETÓRIO C:\GIPP\DATA\</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#00aaaa] text-black">
                        <th className="p-1 border border-white">TABELA</th>
                        <th className="p-1 border border-white">REGISTROS</th>
                        <th className="p-1 border border-white">TAMANHO</th>
                        <th className="p-1 border border-white">INDICE PRIMÁRIO</th>
                        <th className="p-1 border border-white">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { dbf: 'MEMBROS.DBF', regs: '1.240', size: '481 KB', ntx: 'MEM01.NTX (NOME)', viewId: 'cad_membro' },
                        { dbf: 'CONGREG.DBF', regs: '14', size: '98 KB', ntx: 'CONG01.NTX (CIDADE)', viewId: 'cad_igreja' },
                        { dbf: 'FINENTR.DBF', regs: '4.890', size: '742 KB', ntx: 'ENTR01.NTX (DATA)', viewId: 'fin_entrada' },
                        { dbf: 'FINSAID.DBF', regs: '1.420', size: '315 KB', ntx: 'SAID01.NTX (DATA)', viewId: 'fin_saidas' },
                        { dbf: 'EBDALUN.DBF', regs: '420', size: '180 KB', ntx: 'EBD01.NTX (CLASSE)', viewId: 'secretaria_ebd' },
                        { dbf: 'TEOLOGI.DBF', regs: '18', size: '320 KB', ntx: 'TEO01.NTX (MODULO)', viewId: 'curso_teologia' },
                        { dbf: 'VISITAN.DBF', regs: '280', size: '84 KB', ntx: 'VIS01.NTX (DATA)', viewId: 'visitantes' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#00aaaa] hover:text-black text-white">
                          <td className="p-1 border border-white font-bold">{row.dbf}</td>
                          <td className="p-1 border border-white">{row.regs}</td>
                          <td className="p-1 border border-white">{row.size}</td>
                          <td className="p-1 border border-white text-[#55ffff]">{row.ntx}</td>
                          <td className="p-1 border border-white">
                            <button
                              onClick={() => {
                                playSelectSound();
                                setView(row.viewId);
                                setShowDbfViewer(false);
                              }}
                              className="bg-black text-[#ffff55] px-2 py-0.5 hover:bg-white hover:text-black text-[10px] font-bold"
                            >
                              USE &gt;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#000080] p-2 border border-white text-[11px]">
                <span className="text-[#55ffff]">CODEPAGE: CP850 (LATIN-1 DOS) | RDD: DBFNTX</span>
                <button
                  onClick={() => { playKeyClick(); setShowDbfViewer(false); }}
                  className="bg-[#00aaaa] text-black px-4 py-1 font-bold hover:bg-white"
                >
                  &lt; RETORNAR AO SISTEMA &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. CLIPPER MODULES CATALOG MODAL (F4) */}
      {/* ============================================================ */}
      {showModulesCatalog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-[#0000aa] border-4 border-white shadow-[12px_12px_0px_#000000] p-1 font-mono text-[12px]">
            <div className="bg-[#00aaaa] text-black px-3 py-1 flex items-center justify-between font-bold border-b-2 border-white">
              <span>LOCALIZADOR DE MÓDULOS GIPP [F4]</span>
              <button
                onClick={() => { playKeyClick(); setShowModulesCatalog(false); }}
                className="bg-black text-white px-1.5 hover:bg-white hover:text-black font-bold"
              >
                X
              </button>
            </div>

            <div className="p-3">
              <div className="mb-3">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="DIGITE PARA FILTRAR (EX: MEMBROS, CAIXA, EBD)..."
                  className="w-full bg-[#000080] text-[#ffff55] border-2 border-white p-2 outline-none font-bold uppercase placeholder:text-white/40"
                  autoFocus
                />
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar border border-white bg-[#000080]">
                {filteredModules.length === 0 ? (
                  <div className="p-6 text-center text-[#ffff55]">Nenhum módulo encontrado.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1">
                    {filteredModules.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          playSelectSound();
                          setView(m.id);
                          setShowModulesCatalog(false);
                        }}
                        className="text-left p-2 bg-[#0000aa] hover:bg-[#00aaaa] hover:text-black text-white border border-white/40 flex items-center justify-between group cursor-pointer"
                      >
                        <span className="font-bold truncate">{m.label}</span>
                        <span className="text-[10px] text-[#55ffff] group-hover:text-black font-black">&lt; ENTER &gt;</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex justify-between items-center text-[11px] text-[#55ffff]">
                <span>Total de Módulos: {filteredModules.length}</span>
                <button
                  onClick={() => { playKeyClick(); setShowModulesCatalog(false); }}
                  className="bg-black text-white px-3 py-1 border border-white hover:bg-white hover:text-black font-bold"
                >
                  &lt; FECHAR [ESC] &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. CLIPPER THEME SELECTOR MODAL (F6) */}
      {/* ============================================================ */}
      {showThemePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-[#0000aa] border-4 border-white shadow-[12px_12px_0px_#000000] p-1 font-mono text-[12px]">
            <div className="bg-[#00aaaa] text-black px-3 py-1 flex items-center justify-between font-bold border-b-2 border-white">
              <span>SELEÇÃO DE TEMA DO SISTEMA [F6]</span>
              <button
                onClick={() => { playKeyClick(); setShowThemePicker(false); }}
                className="bg-black text-white px-1.5 hover:bg-white hover:text-black font-bold"
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-[#ffff55] text-xs">
                Selecione o ambiente operacional desejado para operar o GIPP:
              </p>

              <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar border border-white p-1 bg-[#000080]">
                {[
                  { id: 'gipp_clipper', label: 'GIPP CLIPPER (CA-Clipper 5.3) 💾' },
                  { id: 'win81', label: 'Windows 8.1 (Modern UI & Tiles) 🪟' },
                  { id: 'win11', label: 'Windows 11 (Fluent Design)' },
                  { id: 'gipp_retro', label: 'GIPP RETRO (Delphi 13 Florence) ⚡' },
                  { id: 'win95', label: 'Windows 95 (Retro 95)' },
                  { id: 'default', label: 'GIPP Padrão (Moderno)' },
                  { id: 'macos_tahoe', label: 'macOS 26 Tahoe ' },
                  { id: 'linux', label: 'Linux Ubuntu (GNOME)' },
                  { id: 'premium_black', label: 'Premium Black & Gold' },
                  { id: 'futuristic', label: 'GIPP Sci-Fi Futurista' }
                ].map(t => {
                  const isCurrent = osTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        playSelectSound();
                        setOsTheme(t.id);
                        setShowThemePicker(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 border font-bold flex items-center justify-between cursor-pointer ${
                        isCurrent 
                          ? 'bg-[#00aaaa] text-black border-white' 
                          : 'bg-[#0000aa] text-white border-white/30 hover:bg-white hover:text-black'
                      }`}
                    >
                      <span>{t.label}</span>
                      {isCurrent ? <span className="bg-black text-[#ffff55] px-1 text-[10px]">ATIVO</span> : <span>&gt;</span>}
                    </button>
                  );
                })}
              </div>

              <div className="text-right pt-2">
                <button
                  onClick={() => { playKeyClick(); setShowThemePicker(false); }}
                  className="bg-black text-white px-4 py-1 border border-white hover:bg-white hover:text-black font-bold"
                >
                  &lt; FECHAR &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. CLIPPER ALERT MODAL: LOGOUT CONFIRMATION (ALERT()) */}
      {/* ============================================================ */}
      {showAlertLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-96 bg-[#0000aa] border-4 border-white shadow-[12px_12px_0px_#000000] p-1 font-mono text-center">
            <div className="bg-red-700 text-white py-1 px-3 font-black text-sm uppercase tracking-widest border-b-2 border-white">
              ╔══[ ATENÇÃO / ALERTA DE SISTEMA ]══╗
            </div>
            
            <div className="p-6 bg-[#000080] border-y border-white my-1">
              <p className="text-white text-xs leading-relaxed mb-1">
                Deseja realmente encerrar a sessão e retornar ao prompt do DOS?
              </p>
              <p className="text-[#ffff55] text-[11px]">
                Todas as alterações nos arquivos .DBF foram gravadas.
              </p>
            </div>

            <div className="p-3 bg-[#0000aa] flex justify-center gap-4">
              <button
                onClick={() => {
                  playSelectSound();
                  setShowAlertLogout(false);
                  handleLogoutRequest();
                }}
                className="bg-red-700 text-white hover:bg-white hover:text-red-700 px-5 py-1.5 border-2 border-white font-black text-xs cursor-pointer uppercase"
              >
                &lt; [S]IM, SAIR &gt;
              </button>
              <button
                onClick={() => {
                  playKeyClick();
                  setShowAlertLogout(false);
                }}
                className="bg-[#00aaaa] text-black hover:bg-white hover:text-black px-5 py-1.5 border-2 border-white font-black text-xs cursor-pointer uppercase"
                autoFocus
              >
                &lt; [N]ÃO, FICAR &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 10. CLIPPER HELP & ABOUT DIALOG (F1) */}
      {/* ============================================================ */}
      {showHelpDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl bg-[#0000aa] border-4 border-white shadow-[12px_12px_0px_#000000] p-1 font-mono text-[12px]">
            <div className="bg-[#00aaaa] text-black px-3 py-1 flex items-center justify-between font-bold border-b-2 border-white">
              <span>MANUAL DO OPERADOR - GIPP CLIPPER 5.3b</span>
              <button
                onClick={() => { playKeyClick(); setShowHelpDialog(false); }}
                className="bg-black text-white px-1.5 hover:bg-white hover:text-black font-bold"
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-3 bg-[#000080]">
              <div className="text-[#ffff55] font-black uppercase text-sm border-b border-white pb-1">
                TECLAS DE ATALHO PADRONIZADAS:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-white">
                <div><span className="text-[#55ffff] font-bold">[F1]</span> Ajuda e Manual de Instruções</div>
                <div><span className="text-[#55ffff] font-bold">[F2]</span> Gravação Rápida de Registros</div>
                <div><span className="text-[#55ffff] font-bold">[F3]</span> Pesquisa e Filtro de Dados</div>
                <div><span className="text-[#55ffff] font-bold">[F4]</span> Catálogo de Módulos GIPP</div>
                <div><span className="text-[#55ffff] font-bold">[F5]</span> Alternar Modo Tela Cheia</div>
                <div><span className="text-[#55ffff] font-bold">[F6]</span> Seletor de Temas do Sistema</div>
                <div><span className="text-[#55ffff] font-bold">[F7]</span> Calculadora Auxiliar Pop-up</div>
                <div><span className="text-[#55ffff] font-bold">[F8]</span> Linha de Comando (DOT PROMPT)</div>
                <div><span className="text-[#55ffff] font-bold">[F9]</span> Visualizador de Tabelas DBF</div>
                <div><span className="text-[#55ffff] font-bold">[F10]</span> Ativação do Menu Superior</div>
                <div><span className="text-[#55ffff] font-bold">[ESC]</span> Cancelar / Retornar / Sair</div>
                <div><span className="text-[#55ffff] font-bold">[ENTER]</span> Confirmar Ação / Salvar</div>
              </div>

              <div className="border-t border-white/50 pt-2 text-[10px] text-white/80 leading-tight">
                GIPP CLIPPER EDITION - Desenvolvido em homenagem à era dourada do CA-Clipper Summer '87 / 5.x.
                Compatível com banco de dados relacional e arquitetura em nuvem mantendo 100% da experiência clássica DOS.
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => { playKeyClick(); setShowHelpDialog(false); }}
                  className="bg-[#00aaaa] text-black px-6 py-1 border-2 border-white hover:bg-white hover:text-black font-black uppercase cursor-pointer"
                >
                  &lt; ENTENDIDO [ENTER] &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
