import React, { useState } from 'react';
import { 
  Grid, RefreshCw, Sparkles, Settings, Sliders, Plus, 
  Monitor, LayoutGrid, Pin, Trash2, ExternalLink, XCircle, 
  ChevronRight, Check
} from 'lucide-react';

export interface DesktopContextMenuState {
  x: number;
  y: number;
}

export interface ItemContextMenuState {
  x: number;
  y: number;
  moduleId: string;
  type: 'desktop' | 'start' | 'taskbar';
}

interface Win11ContextMenuProps {
  desktopMenu: DesktopContextMenuState | null;
  itemMenu: ItemContextMenuState | null;
  onClose: () => void;
  isLight: boolean;
  allModules: any[];
  desktopShortcuts: Array<{ id: string; label: string; x: number; y: number }>;
  pinnedStartIds: string[];
  pinnedTaskbarIds: string[];
  currentView: string;
  desktopIconSize: 'small' | 'medium' | 'large';
  setDesktopIconSize: (size: 'small' | 'medium' | 'large') => void;
  onAutoArrange: () => void;
  onOpenNewShortcutModal: () => void;
  onOpenWallpaperModal: () => void;
  onOpenProperties: () => void;
  onOpenVisualConfig: () => void;
  onOpenModule: (moduleId: string) => void;
  onCloseModule: () => void;
  onToggleDesktopShortcut: (moduleId: string) => void;
  onTogglePinStart: (moduleId: string) => void;
  onTogglePinTaskbar: (moduleId: string) => void;
}

export const Win11ContextMenu: React.FC<Win11ContextMenuProps> = ({
  desktopMenu,
  itemMenu,
  onClose,
  isLight,
  allModules,
  desktopShortcuts,
  pinnedStartIds,
  pinnedTaskbarIds,
  currentView,
  desktopIconSize,
  setDesktopIconSize,
  onAutoArrange,
  onOpenNewShortcutModal,
  onOpenWallpaperModal,
  onOpenProperties,
  onOpenVisualConfig,
  onOpenModule,
  onCloseModule,
  onToggleDesktopShortcut,
  onTogglePinStart,
  onTogglePinTaskbar
}) => {
  const [viewSubmenuOpen, setViewSubmenuOpen] = useState(false);

  if (!desktopMenu && !itemMenu) return null;

  // --- ITEM CONTEXT MENU (CLIQUE DIREITO EM ÍCONE DO DESKTOP, MENU INICIAR OU TASKBAR) ---
  if (itemMenu) {
    const meta = allModules.find(m => m.id === itemMenu.moduleId);
    const hasDesktop = desktopShortcuts.some(s => s.id === itemMenu.moduleId);
    const hasStart = pinnedStartIds.includes(itemMenu.moduleId);
    const hasTaskbar = pinnedTaskbarIds.includes(itemMenu.moduleId);
    const isRunning = currentView === itemMenu.moduleId;

    // Calcular posição com limites de tela
    const posX = Math.min(itemMenu.x, window.innerWidth - 260);
    const posY = Math.min(itemMenu.y, window.innerHeight - 320);

    return (
      <>
        <div 
          className="fixed inset-0 z-50 bg-transparent" 
          onClick={onClose} 
          onContextMenu={(e) => { e.preventDefault(); onClose(); }} 
        />
        <div
          style={{ left: `${posX}px`, top: `${posY}px` }}
          className={`fixed z-50 w-64 rounded-2xl shadow-2xl border p-1.5 backdrop-blur-3xl select-none animate-in fade-in zoom-in-95 duration-100 ${
            isLight 
              ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-400/40' 
              : 'bg-[#202028]/95 border-white/15 text-white shadow-black/80'
          }`}
        >
          {/* Header com Nome do Item */}
          <div className="px-3 py-1.5 border-b border-slate-500/15 mb-1">
            <div className="text-[11px] font-black tracking-tight truncate text-sky-500">
              {meta?.label || itemMenu.moduleId}
            </div>
            <div className="text-[9px] opacity-60">
              {meta?.category || 'Módulo do Sistema'}
            </div>
          </div>

          {/* Abrir */}
          <button
            onClick={() => {
              onOpenModule(itemMenu.moduleId);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
          >
            <ExternalLink size={14} className="text-sky-500" />
            <span>Abrir Módulo</span>
          </button>

          <div className="my-1 border-t border-slate-500/15" />

          {/* Fixar / Desafixar do Menu Iniciar */}
          <button
            onClick={() => {
              onTogglePinStart(itemMenu.moduleId);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
          >
            <LayoutGrid size={14} className="text-indigo-400" />
            <span>{hasStart ? 'Desafixar do Iniciar' : 'Fixar no Menu Iniciar'}</span>
          </button>

          {/* Fixar / Desafixar da Barra de Tarefas */}
          <button
            onClick={() => {
              onTogglePinTaskbar(itemMenu.moduleId);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
          >
            <Pin size={14} className="text-amber-400" />
            <span>{hasTaskbar ? 'Desafixar da Barra de Tarefas' : 'Fixar na Barra de Tarefas'}</span>
          </button>

          {/* Adicionar / Remover da Área de Trabalho */}
          <button
            onClick={() => {
              onToggleDesktopShortcut(itemMenu.moduleId);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
          >
            {itemMenu.type === 'desktop' ? (
              <>
                <Trash2 size={14} className="text-rose-500" />
                <span className="text-rose-500 font-bold">Excluir Atalho do Desktop</span>
              </>
            ) : (
              <>
                <Monitor size={14} className="text-emerald-400" />
                <span>{hasDesktop ? 'Remover da Área de Trabalho' : 'Criar Atalho no Desktop'}</span>
              </>
            )}
          </button>

          {/* Se estiver em execução, botão para Fechar Janela */}
          {isRunning && (
            <>
              <div className="my-1 border-t border-slate-500/15" />
              <button
                onClick={() => {
                  onCloseModule();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-500/15 text-rose-500 transition-colors cursor-pointer text-left"
              >
                <XCircle size={14} />
                <span>Fechar Janela</span>
              </button>
            </>
          )}

          <div className="my-1 border-t border-slate-500/15" />

          {/* Propriedades */}
          <button
            onClick={() => {
              onOpenProperties();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
          >
            <Sliders size={14} className="text-slate-400" />
            <span>Propriedades do Módulo</span>
          </button>
        </div>
      </>
    );
  }

  // --- DESKTOP CONTEXT MENU (CLIQUE DIREITO NO ESPAÇO VAZIO DO DESKTOP) ---
  const posX = Math.min(desktopMenu!.x, window.innerWidth - 260);
  const posY = Math.min(desktopMenu!.y, window.innerHeight - 340);

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-transparent" 
        onClick={onClose} 
        onContextMenu={(e) => { e.preventDefault(); onClose(); }} 
      />
      <div
        style={{ left: `${posX}px`, top: `${posY}px` }}
        className={`fixed z-50 w-64 rounded-2xl shadow-2xl border p-1.5 backdrop-blur-3xl select-none animate-in fade-in zoom-in-95 duration-100 ${
          isLight 
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-400/40' 
            : 'bg-[#202028]/95 border-white/15 text-white shadow-black/80'
        }`}
      >
        {/* Exibir (com submenu de tamanho de ícones) */}
        <div className="relative">
          <button
            onClick={() => setViewSubmenuOpen(!viewSubmenuOpen)}
            onMouseEnter={() => setViewSubmenuOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Grid size={14} className="text-sky-500" />
              <span>Exibir</span>
            </div>
            <ChevronRight size={13} className="opacity-50" />
          </button>

          {/* Submenu Exibir */}
          {viewSubmenuOpen && (
            <div 
              className={`absolute left-full top-0 ml-1 w-48 rounded-2xl shadow-2xl border p-1.5 backdrop-blur-3xl select-none animate-in fade-in zoom-in-95 duration-100 ${
                isLight 
                  ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-400/40' 
                  : 'bg-[#202028]/95 border-white/15 text-white shadow-black/80'
              }`}
            >
              <button
                onClick={() => {
                  setDesktopIconSize('large');
                  setViewSubmenuOpen(false);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs hover:bg-sky-500/15 cursor-pointer"
              >
                <span>Ícones grandes</span>
                {desktopIconSize === 'large' && <Check size={13} className="text-sky-500" />}
              </button>
              <button
                onClick={() => {
                  setDesktopIconSize('medium');
                  setViewSubmenuOpen(false);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs hover:bg-sky-500/15 cursor-pointer"
              >
                <span>Ícones médios</span>
                {desktopIconSize === 'medium' && <Check size={13} className="text-sky-500" />}
              </button>
              <button
                onClick={() => {
                  setDesktopIconSize('small');
                  setViewSubmenuOpen(false);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs hover:bg-sky-500/15 cursor-pointer"
              >
                <span>Ícones pequenos</span>
                {desktopIconSize === 'small' && <Check size={13} className="text-sky-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Organizar ícones em grade */}
        <button
          onClick={() => {
            onAutoArrange();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
        >
          <Grid size={14} className="text-indigo-400" />
          <span>Organizar ícones em grade</span>
        </button>

        {/* Atualizar */}
        <button
          onClick={() => {
            window.location.reload();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
        >
          <RefreshCw size={14} className="text-emerald-500" />
          <span>Atualizar Área de Trabalho (F5)</span>
        </button>

        <div className="my-1 border-t border-slate-500/15" />

        {/* Adicionar Novo Atalho */}
        <button
          onClick={() => {
            onOpenNewShortcutModal();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-sky-500/15 text-sky-500 transition-colors cursor-pointer text-left"
        >
          <Plus size={14} />
          <span>Adicionar Atalho no Desktop...</span>
        </button>

        <div className="my-1 border-t border-slate-500/15" />

        {/* Papel de Parede */}
        <button
          onClick={() => {
            onOpenWallpaperModal();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
        >
          <Sparkles size={14} className="text-purple-500" />
          <span>Personalizar Papel de Parede</span>
        </button>

        {/* Configurações de Exibição */}
        <button
          onClick={() => {
            onOpenVisualConfig();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
        >
          <Settings size={14} className="text-indigo-500" />
          <span>Configurações de Exibição</span>
        </button>

        <div className="my-1 border-t border-slate-500/15" />

        {/* Propriedades do GIPP */}
        <button
          onClick={() => {
            onOpenProperties();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-sky-500/15 transition-colors cursor-pointer text-left"
        >
          <Sliders size={14} className="text-amber-500" />
          <span>Propriedades do Sistema GIPP</span>
        </button>
      </div>
    </>
  );
};
