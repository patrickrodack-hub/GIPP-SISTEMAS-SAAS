import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Search, X, Settings, LogOut, 
  Maximize2, Minimize2, Sparkles, Palette,
  Wifi, HelpCircle, Check, ChevronRight,
  RotateCcw, Sliders, ExternalLink,
  ShieldCheck, ArrowLeft, Terminal
} from 'lucide-react';
import { SYSTEM_DIVISIONS, groupModulesByDivision, getDivisionForModule, getAvailableDivisions } from '../constants/systemDivisions';
import { requestAppFullscreen } from '../lib/performanceHelpers';

interface NewGippLayoutProps {
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

// Official GIPP Large Elegant Typography Display (purely typographic, smooth, and imposing)
const GippBrandingTypography: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="relative flex flex-col items-center justify-center select-none group cursor-pointer py-4"
    >
      {/* Soft Ambient Radial Backlight Glow */}
      <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.25)_0%,rgba(16,185,129,0.1)_40%,transparent_70%)] pointer-events-none blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

      {/* Main GIPP Brand Title: Big, elegant, smooth, and powerful display typography */}
      <div className="relative flex items-baseline justify-center">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.14em] uppercase font-sans transition-transform duration-500 group-hover:scale-[1.02] filter drop-shadow-[0_12px_24px_rgba(15,23,42,0.12)] dark:drop-shadow-[0_12px_30px_rgba(20,184,166,0.35)]">
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-950 dark:from-white dark:via-teal-100 dark:to-emerald-200">
            GIPP
          </span>
          <span className="text-teal-500 dark:text-teal-400 text-4xl sm:text-5xl md:text-6xl lg:text-7xl ml-1 font-bold">
            .
          </span>
        </h1>
      </div>

      {/* Subtitle with elegant wide tracking */}
      <div className="mt-2 text-center">
        <p className="text-xs sm:text-sm md:text-base font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-slate-700 dark:text-teal-200/90 drop-shadow-sm">
          Sistema de Gestão Eclesiástica
        </p>

        <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase text-slate-500 dark:text-teal-300/60 mt-1">
          Gestão Integrada de Portais Pastorais
        </p>
      </div>

      {/* Subtle Divider with Studio Tag */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-teal-500/40 dark:to-teal-400/40" />
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/20 text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>STUDIO EDITION • OFICIAL</span>
        </div>
        <div className="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-teal-500/40 dark:to-teal-400/40" />
      </div>

      {/* Soft Ground Shadow / Room reflection */}
      <div className="w-64 sm:w-80 h-3 bg-teal-950/15 dark:bg-[#071720]/40 rounded-full blur-md mt-4 scale-y-75 pointer-events-none" />
    </div>
  );
};

export const NewGippLayout: React.FC<NewGippLayoutProps> = ({
  view,
  setView,
  user,
  db,
  mMeta,
  isModuleAllowed,
  hasPermission: _hasPermission,
  CurrentModule,
  currentProps,
  handleLogoutRequest,
  setIsScreenLocked,
  theme,
  setTheme,
  osTheme,
  setOsTheme: _setOsTheme,
  ALL_AVAILABLE_MODULES,
  addToast
}) => {
  // State for sidebar filter and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [studioTab, setStudioTab] = useState<'overview' | 'settings' | 'modules'>('overview');

  // Filter modules
  const filteredModules = useMemo(() => {
    return ALL_AVAILABLE_MODULES.filter(m => {
      if (!isModuleAllowed(m.id)) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const div = getDivisionForModule(m.id);
      return (
        m.label.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        div.name.toLowerCase().includes(q) ||
        div.shortName.toLowerCase().includes(q)
      );
    });
  }, [ALL_AVAILABLE_MODULES, isModuleAllowed, searchQuery]);

  // Group by division
  const divisionGroups = useMemo(() => {
    const grouped = groupModulesByDivision(filteredModules, user);
    if (selectedDivision === 'all') return grouped;
    return grouped.filter(g => g.division.id === selectedDivision);
  }, [filteredModules, selectedDivision, user]);

  // Handle module click
  const handleSelectModule = (modId: string) => {
    setView(modId);
  };

  const isHomeView = !view || view === 'dashboard';

  return (
    <div className="h-screen w-full font-sans text-slate-100 bg-[#08151c] relative overflow-hidden select-none flex flex-col">
      {/* --- Serene Twilight Ocean Wallpaper (matching reference screenshot) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=1920&auto=format&fit=crop')` 
          }}
        />
        {/* Soft dusk teal gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06141a]/90 via-[#0a1e27]/50 to-[#071922]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_25%,rgba(16,185,129,0.18)_0%,transparent_65%)]" />
      </div>

      {/* --- TOP HEADER BAR --- */}
      <header className="h-11 bg-[#091a22]/85 backdrop-blur-md border-b border-teal-500/20 flex items-center justify-between px-4 sm:px-6 z-40 shrink-0 text-xs font-semibold text-white/90">
        {/* Left: Brand Badge & Quick Nav */}
        <div className="flex items-center gap-3">
          {/* Logo Pill */}
          <div 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-teal-500/30 to-emerald-500/20 border border-teal-400/30 hover:border-teal-400/60 cursor-pointer transition-all shadow-sm"
          >
            <div className="w-5 h-5 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-300">
              <Sparkles size={13} />
            </div>
            <span className="font-bold tracking-wider text-teal-200 uppercase text-[11px]">
              New GIPP
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-white/70">
            <button 
              onClick={() => setView('dashboard')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                isHomeView ? 'bg-teal-500/20 text-teal-300 font-bold' : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              Studio
            </button>
            <button 
              onClick={() => setView('config_sistema')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                view === 'config_sistema' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              Setup
            </button>
            <button 
              onClick={() => setView('config_visual')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                view === 'config_visual' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              Visual
            </button>
          </div>
        </div>

        {/* Center: Dynamic Status / Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-white/80">
          <span className="text-teal-400 font-medium">New GIPP Studio</span>
          <span className="text-white/30">•</span>
          <span className="text-white/90 truncate max-w-[200px]">{mMeta.label || 'Visão Geral'}</span>
        </div>

        {/* Right: Controls & User */}
        <div className="flex items-center gap-2.5">
          {/* Status Online Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Online</span>
          </div>

          {/* Fullscreen Button */}
          <button 
            onClick={() => requestAppFullscreen()}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Tela Cheia"
          >
            <Maximize2 size={13} />
          </button>

          {/* Theme Light/Dark */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Alternar Modo Escuro/Claro"
          >
            <Palette size={13} />
          </button>

          {/* Lock Screen */}
          <button
            onClick={() => setIsScreenLocked(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Bloquear Tela"
          >
            <ShieldCheck size={13} />
          </button>

          {/* User Info / Logout */}
          <div className="flex items-center gap-2 pl-1 border-l border-white/15">
            <div className="w-6 h-6 rounded-full bg-teal-600/50 border border-teal-400/40 flex items-center justify-center text-[10px] font-bold text-teal-100">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <button
              onClick={handleLogoutRequest}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 text-white/70 transition-colors cursor-pointer"
              title="Sair do Sistema"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* --- DESKTOP WORKSPACE AREA --- */}
      <div className="flex-1 relative z-10 flex p-3 sm:p-5 gap-4 overflow-hidden">
        
        {/* =================================================================== */}
        {/* LEFT FLOATING PANEL (Exact match to reference screenshot) */}
        {/* =================================================================== */}
        <aside 
          className={`shrink-0 flex flex-col bg-[#0b1c24]/90 backdrop-blur-xl border border-teal-400/20 rounded-3xl shadow-2xl transition-all duration-300 z-20 ${
            sidebarCollapsed ? 'w-16' : 'w-64 sm:w-72'
          }`}
        >
          {/* Top Search & Filter Bar */}
          <div className="p-3 border-b border-teal-500/15">
            <div className="flex items-center gap-2">
              {/* Green Icon Button (Mirroring the screenshot) */}
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform shrink-0 cursor-pointer"
                title={sidebarCollapsed ? "Expandir Painel" : "Recolher Painel"}
              >
                <Terminal size={15} />
              </button>

              {!sidebarCollapsed && (
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar módulos..."
                    className="w-full bg-[#07131a]/80 border border-teal-500/25 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-teal-100 placeholder:text-teal-400/40 focus:outline-none focus:border-teal-400/60 transition-colors"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-teal-400/60" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Division Quick Filter Pills (when expanded) */}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar mt-2.5 pt-1 pb-1">
                <button
                  onClick={() => setSelectedDivision('all')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] shrink-0 font-medium transition-colors cursor-pointer ${
                    selectedDivision === 'all'
                      ? 'bg-teal-500/30 text-teal-200 border border-teal-400/40'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Todas
                </button>
                {getAvailableDivisions(user).map(div => (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivision(div.id)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] shrink-0 font-medium transition-colors cursor-pointer ${
                      selectedDivision === div.id
                        ? 'bg-teal-500/30 text-teal-200 border border-teal-400/40'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {div.shortName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Module List (with discrete numerical badges like in the screenshot!) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
            {divisionGroups.map(group => {
              const DivIcon = group.division.icon;
              return (
                <div key={group.division.id} className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-teal-400/70 uppercase">
                      <div className="flex items-center gap-1.5 truncate">
                        <DivIcon size={11} style={{ color: group.division.color }} />
                        <span className="truncate">{group.division.name}</span>
                      </div>
                      <span className="text-white/30 font-mono text-[9px]">{group.items.length}</span>
                    </div>
                  )}

                  <div className="space-y-0.5">
                    {group.items.map((mod, idx) => {
                      const Icon = mod.icon || LayoutDashboard;
                      const isActive = view === mod.id;
                      
                      // Discrete aesthetic numeric counter (mirroring screenshot: "1 0 7", "1 2 3", etc.)
                      const counterText = `${(idx + 1) * 3 % 9 + 1} ${(idx * 7) % 8} ${((idx + 2) * 5) % 9}`;

                      return (
                        <div
                          key={mod.id}
                          onClick={() => handleSelectModule(mod.id)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all group ${
                            isActive 
                              ? 'bg-teal-500/25 border border-teal-400/40 text-teal-100 shadow-sm' 
                              : 'hover:bg-white/10 text-slate-200 hover:text-white'
                          }`}
                          title={mod.label}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive ? 'bg-teal-400/30 text-teal-200' : 'bg-white/5 text-white/70 group-hover:text-teal-300'
                            }`}>
                              <Icon size={13} />
                            </div>
                            {!sidebarCollapsed && (
                              <span className="text-xs font-medium truncate">
                                {mod.label}
                              </span>
                            )}
                          </div>

                          {/* Numeric indicator on right side (exact match to user's image) */}
                          {!sidebarCollapsed && (
                            <span className="text-[10px] font-mono tracking-widest text-white/30 group-hover:text-teal-400/80 shrink-0 ml-1">
                              {counterText}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Tools / Quick Actions */}
          <div className="p-2 border-t border-teal-500/15 flex items-center justify-around text-white/60">
            <button
              onClick={() => setView('config_visual')}
              className="p-1.5 rounded-xl hover:bg-white/10 hover:text-teal-300 transition-colors cursor-pointer"
              title="Personalização Visual"
            >
              <Palette size={14} />
            </button>
            <button
              onClick={() => setView('config_sistema')}
              className="p-1.5 rounded-xl hover:bg-white/10 hover:text-teal-300 transition-colors cursor-pointer"
              title="Ajustes do Sistema"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={() => setView('manual')}
              className="p-1.5 rounded-xl hover:bg-white/10 hover:text-teal-300 transition-colors cursor-pointer"
              title="Manual & Ajuda"
            >
              <HelpCircle size={14} />
            </button>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* ACTIVE FLOATING WINDOW (Exact match to reference screenshot) */}
        {/* =================================================================== */}
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isMaximized ? 'fixed inset-3 z-50' : ''}`}>
          <div className="flex-1 flex flex-col bg-[#f4f7f6] dark:bg-[#0b1921] rounded-3xl shadow-2xl border border-teal-400/30 overflow-hidden text-slate-800 dark:text-slate-100">
            
            {/* Window Dark Slate Title Bar */}
            <div className="h-11 bg-[#0d222c] text-white px-4 sm:px-5 flex items-center justify-between border-b border-teal-500/20 select-none shrink-0">
              {/* Left: Mascot/Emblem Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-amber-950 font-black text-xs shadow-sm">
                  ⚡
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {isHomeView ? 'GIPP Studio' : mMeta.label}
                  </span>
                  <span className="hidden sm:inline text-[10px] text-teal-300/70 font-mono bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-500/20">
                    New GIPP
                  </span>
                </div>
              </div>

              {/* Right: Window Controls */}
              <div className="flex items-center gap-1.5 text-white/70">
                {!isHomeView && (
                  <button
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10 text-xs text-teal-300 transition-colors cursor-pointer mr-2"
                  >
                    <ArrowLeft size={12} />
                    <span>Início</span>
                  </button>
                )}

                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 rounded-lg hover:bg-white/15 text-white transition-colors cursor-pointer"
                  title={isMaximized ? "Restaurar" : "Maximizar"}
                >
                  {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>

                <button
                  onClick={() => setView('dashboard')}
                  className="p-1.5 rounded-lg hover:bg-rose-500/80 hover:text-white text-white/80 transition-colors cursor-pointer"
                  title="Fechar Janela"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Window Body Workspace */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-[#f4f7f6] dark:bg-[#07131a]">
              {isHomeView ? (
                /* =============================================================== */
                /* NEW GIPP STUDIO / SETUP VIEW (Exact recreation of screenshot!) */
                /* =============================================================== */
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 sm:p-8 gap-6 sm:gap-10">
                  
                  {/* Left Column Inside Window: Category & Setup list */}
                  <div className="w-full md:w-64 shrink-0 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-teal-500/20 pb-4 md:pb-0 md:pr-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-teal-200 tracking-tight mb-4">
                        GIPP Studio
                      </h3>

                      <nav className="space-y-1 text-xs">
                        {[
                          { id: 'cad_igreja', label: 'Visão Geral' },
                          { id: 'config_sistema', label: 'Configurações' },
                          { id: 'cad_membro', label: 'Secretaria & Membresia' },
                          { id: 'fin_entrada', label: 'Gestão Financeira' },
                          { id: 'acessos_portal', label: 'Portal de Acessos' },
                          { id: 'secretaria_ebd', label: 'Escola Bíblica' },
                          { id: 'curso_teologia', label: 'Biblioteca Teológica' },
                          { id: 'missoes_painel', label: 'Painel de Missões' },
                          { id: 'auditoria', label: 'Suporte & Auditoria' }
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleSelectModule(item.id)}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-teal-500/15 hover:text-teal-700 dark:hover:text-teal-200 flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <span className="truncate">{item.label}</span>
                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-teal-600 dark:text-teal-400 transition-opacity" />
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Church Database Info */}
                    <div className="mt-4 p-3 rounded-2xl bg-white dark:bg-[#0d202a] border border-slate-200/80 dark:border-teal-500/20 shadow-xs">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-teal-100 truncate">
                        {db?.igreja?.nome || 'Igreja Conectada'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-teal-400/60 mt-0.5">
                        New GIPP Engine v4.5
                      </div>
                    </div>
                  </div>

                  {/* Center Column: Large Elegant GIPP Typography & Action Buttons */}
                  <div className="flex-1 flex flex-col items-center justify-center p-4">
                    
                    {/* Large Elegant GIPP Display Typography */}
                    <GippBrandingTypography 
                      onClick={() => addToast?.('GIPP - Gestão Integrada de Portais Pastorais', 'info')} 
                    />

                    {/* Action Buttons Section */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-sm">
                      {/* Setup Card Button */}
                      <button
                        onClick={() => {
                          setView('config_sistema');
                          addToast?.('Abrindo Setup do Sistema...', 'info');
                        }}
                        className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-white dark:bg-[#0c1f28] hover:bg-slate-50 dark:hover:bg-[#102733] border border-slate-200 dark:border-teal-400/30 text-slate-700 dark:text-slate-200 font-bold text-sm text-center shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sliders size={15} className="text-teal-600 dark:text-teal-400" />
                        <span>Setup</span>
                      </button>

                      {/* Emerald Online Pill Button (exact match to image!) */}
                      <button
                        onClick={() => {
                          setView('cad_membro');
                          addToast?.('Acessando Módulos do Sistema', 'success');
                        }}
                        className="w-full sm:w-auto py-3 px-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>Online</span>
                      </button>
                    </div>

                    {/* Quick subtext */}
                    <p className="text-xs text-slate-400 dark:text-teal-300/40 mt-3 text-center">
                      Sistema operacional eclesiástico pronto para operação
                    </p>
                  </div>

                  {/* Right Column: Subtle Vertical Control Strip */}
                  <div className="hidden lg:flex flex-col items-center justify-center gap-2.5 border-l border-slate-200 dark:border-teal-500/20 pl-4 text-slate-400 dark:text-teal-300/60">
                    <button 
                      onClick={() => setView('config_sistema')}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-[#0c1f28] hover:bg-teal-500/20 hover:text-teal-400 border border-slate-200 dark:border-teal-500/30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Ajustes"
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      onClick={() => setView('config_visual')}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-[#0c1f28] hover:bg-teal-500/20 hover:text-teal-400 border border-slate-200 dark:border-teal-500/30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Personalização Visual"
                    >
                      <Palette size={14} />
                    </button>
                    <button 
                      onClick={() => requestAppFullscreen()}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-[#0c1f28] hover:bg-teal-500/20 hover:text-teal-400 border border-slate-200 dark:border-teal-500/30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Tela Cheia"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button 
                      onClick={() => window.location.reload()}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-[#0c1f28] hover:bg-teal-500/20 hover:text-teal-400 border border-slate-200 dark:border-teal-500/30 flex items-center justify-center transition-colors cursor-pointer"
                      title="Recarregar"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                </div>
              ) : (
                /* Active Module Render Container */
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4">
                  <CurrentModule {...currentProps} />
                </div>
              )}
            </div>

            {/* Window Footer Status Bar */}
            <div className="h-7 bg-[#0b1c24] text-white/60 px-4 flex items-center justify-between text-[11px] border-t border-teal-500/20 select-none shrink-0 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Pronto
                </span>
                <span className="text-white/20">|</span>
                <span className="text-white/50">{filteredModules.length} módulos ativos</span>
              </div>

              <div className="flex items-center gap-3">
                <span>UTF-8</span>
                <span className="text-white/20">|</span>
                <span className="text-teal-300 font-sans font-bold">New GIPP</span>
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};
