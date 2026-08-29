import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Check, Monitor, LayoutGrid, Pin, Sparkles, Folder } from 'lucide-react';

interface Win11NewShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
  allModules: any[];
  isModuleAllowed: (id: string) => boolean;
  desktopShortcuts: Array<{ id: string; label: string; x: number; y: number }>;
  pinnedStartIds: string[];
  pinnedTaskbarIds: string[];
  onToggleDesktopShortcut: (moduleId: string) => void;
  onTogglePinStart: (moduleId: string) => void;
  onTogglePinTaskbar: (moduleId: string) => void;
}

export const Win11NewShortcutModal: React.FC<Win11NewShortcutModalProps> = ({
  isOpen,
  onClose,
  isLight,
  allModules,
  isModuleAllowed,
  desktopShortcuts,
  pinnedStartIds,
  pinnedTaskbarIds,
  onToggleDesktopShortcut,
  onTogglePinStart,
  onTogglePinTaskbar
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    allModules.forEach(m => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [allModules]);

  const filteredModules = useMemo(() => {
    return allModules.filter(m => {
      if (!isModuleAllowed(m.id)) return false;
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.label?.toLowerCase().includes(q) ||
          m.id?.toLowerCase().includes(q) ||
          m.category?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allModules, isModuleAllowed, categoryFilter, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border backdrop-blur-3xl animate-in zoom-in-95 duration-150 ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#202028]/95 border-white/15 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-500/15 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-500">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Gerenciar Atalhos & Fixações (Windows 11)</h3>
              <p className="text-[11px] opacity-60">Adicione ou remova módulos da Área de Trabalho, Barra de Tarefas ou Menu Iniciar</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-500/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="p-4 border-b border-slate-500/10 space-y-3 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar módulos por nome ou categoria..."
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                isLight 
                  ? 'bg-slate-100/70 border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20' 
                  : 'bg-white/5 border-white/10 focus:bg-white/10 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30'
              }`}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categorias Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : isLight ? 'hover:bg-slate-200/60 text-slate-600' : 'hover:bg-white/10 text-slate-300'
              }`}
            >
              Todos ({allModules.filter(m => isModuleAllowed(m.id)).length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-sky-500 text-white shadow-xs font-bold'
                    : isLight ? 'hover:bg-slate-200/60 text-slate-600' : 'hover:bg-white/10 text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Módulos */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-2 custom-scrollbar">
          {filteredModules.length === 0 ? (
            <div className="text-center py-10 opacity-60 text-xs">
              Nenhum módulo encontrado com esse critério.
            </div>
          ) : (
            filteredModules.map(m => {
              const IconComp = m.icon || Folder;
              const hasDesktop = desktopShortcuts.some(s => s.id === m.id);
              const hasStart = pinnedStartIds.includes(m.id);
              const hasTaskbar = pinnedTaskbarIds.includes(m.id);

              return (
                <div 
                  key={m.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isLight 
                      ? 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:shadow-sm' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                      <IconComp size={20} className={m.color || 'text-sky-500'} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{m.label}</div>
                      <div className="text-[10px] opacity-60 flex items-center gap-2">
                        <span>{m.category || 'GIPP'}</span>
                        {m.badge && (
                          <span className="bg-sky-500/15 text-sky-400 font-bold px-1.5 py-0.2 rounded-sm text-[9px]">
                            {m.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações de Fixação */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Área de Trabalho */}
                    <button
                      onClick={() => onToggleDesktopShortcut(m.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        hasDesktop 
                          ? 'bg-emerald-500 text-white shadow-xs' 
                          : isLight ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                      title={hasDesktop ? "Remover da Área de Trabalho" : "Adicionar à Área de Trabalho"}
                    >
                      <Monitor size={12} />
                      <span className="hidden sm:inline">Desktop</span>
                      {hasDesktop ? <Check size={11} /> : <Plus size={11} />}
                    </button>

                    {/* Menu Iniciar */}
                    <button
                      onClick={() => onTogglePinStart(m.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        hasStart 
                          ? 'bg-sky-500 text-white shadow-xs' 
                          : isLight ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                      title={hasStart ? "Desafixar do Iniciar" : "Fixar no Iniciar"}
                    >
                      <LayoutGrid size={12} />
                      <span className="hidden sm:inline">Iniciar</span>
                      {hasStart ? <Check size={11} /> : <Plus size={11} />}
                    </button>

                    {/* Barra de Tarefas */}
                    <button
                      onClick={() => onTogglePinTaskbar(m.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        hasTaskbar 
                          ? 'bg-indigo-500 text-white shadow-xs' 
                          : isLight ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                      title={hasTaskbar ? "Desafixar da Barra de Tarefas" : "Fixar na Barra de Tarefas"}
                    >
                      <Pin size={12} />
                      <span className="hidden sm:inline">Barra</span>
                      {hasTaskbar ? <Check size={11} /> : <Plus size={11} />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-500/15 flex items-center justify-between shrink-0">
          <div className="text-[11px] opacity-60">
            Dica: Você também pode <b>arrastar qualquer ícone</b> do Menu Iniciar e soltar no Desktop!
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
