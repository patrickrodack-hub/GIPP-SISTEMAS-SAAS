/**
 * GIPP UNIFIED DESIGN SYSTEM
 * Padrão visual unificado para formulários, botões, abas/menus, cartões e modais em todo o sistema.
 */

export const DS = {
    // FORMULÁRIOS & CAMPOS
    form: {
        label: "block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-0.5",
        labelRequired: "after:content-['*'] after:ml-0.5 after:text-rose-500",
        helperText: "text-[11px] text-slate-500 dark:text-slate-400 mt-1",
        input: "w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        inputSmall: "w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-150",
        select: "w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-150 cursor-pointer",
        textarea: "w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-150 resize-y min-h-[90px]",
        checkbox: "w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800",
        group: "space-y-1.5"
    },

    // BOTÕES
    button: {
        base: "inline-flex items-center justify-center gap-2 font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none whitespace-nowrap",
        
        // Tamanhos
        sizeSm: "px-3 py-1.5 text-xs rounded-lg",
        sizeMd: "px-4 py-2.5 text-sm rounded-xl",
        sizeLg: "px-5 py-3 text-base rounded-xl font-extrabold",
        sizeIcon: "p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800",

        // Variantes de Ação
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow border border-indigo-600/30",
        secondary: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
        success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow border border-emerald-600/30",
        danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow border border-rose-600/30",
        warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow border border-amber-600/30",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent",
        outline: "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
    },

    // ABAS & MENUS SEGMENTADOS
    tabs: {
        container: "flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto custom-scrollbar",
        tabBase: "flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer",
        tabActive: "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60",
        tabInactive: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
    },

    // CARTÕES & PAINÉIS
    card: {
        base: "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden",
        header: "px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/60",
        body: "p-5",
        footer: "px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 flex items-center justify-end gap-2.5"
    },

    // MODAIS
    modal: {
        backdrop: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto",
        container: "relative w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150",
        header: "px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/70",
        title: "text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5",
        body: "p-6 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-4",
        footer: "px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 flex items-center justify-end gap-3"
    },

    // BADGES & STATUS
    badge: {
        base: "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide rounded-full border",
        success: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
        warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
        danger: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
        info: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
        neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    }
};

/**
 * Funções utilitárias auxiliares para compor classes
 */
export const btnPrimary = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const s = size === 'sm' ? DS.button.sizeSm : size === 'lg' ? DS.button.sizeLg : DS.button.sizeMd;
    return `${DS.button.base} ${s} ${DS.button.primary}`;
};

export const btnSecondary = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const s = size === 'sm' ? DS.button.sizeSm : size === 'lg' ? DS.button.sizeLg : DS.button.sizeMd;
    return `${DS.button.base} ${s} ${DS.button.secondary}`;
};

export const btnDanger = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const s = size === 'sm' ? DS.button.sizeSm : size === 'lg' ? DS.button.sizeLg : DS.button.sizeMd;
    return `${DS.button.base} ${s} ${DS.button.danger}`;
};

export const btnGhost = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const s = size === 'sm' ? DS.button.sizeSm : size === 'lg' ? DS.button.sizeLg : DS.button.sizeMd;
    return `${DS.button.base} ${s} ${DS.button.ghost}`;
};
