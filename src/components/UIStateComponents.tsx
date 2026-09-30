import React from 'react';
import { motion } from 'motion/react';
import { Inbox, RefreshCw, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "h-4 w-full", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" style={{ width: `${85 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ columns?: number; rows?: number }> = ({ columns = 5, rows = 6 }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse flex-1"
                style={{ width: `${60 + ((rIdx + cIdx) % 4) * 10}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ModernEmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/50 flex items-center justify-center text-indigo-500 mb-4 shadow-xs">
        {icon || <Inbox size={28} />}
      </div>
      <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Sparkles size={14} />
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export const LayoutLoadingFallback: React.FC<{ theme?: string }> = ({ theme = 'default' }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900/90 text-white p-6 relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col items-center gap-4 bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl animate-fade-in max-w-sm w-full text-center">
        <Loader2 size={36} className="animate-spin text-emerald-400" />
        <div>
          <h2 className="text-sm font-black tracking-wider uppercase text-emerald-300">Carregando Ambiente</h2>
          <p className="text-xs text-slate-300 mt-1 font-medium">Iniciando interface {theme}...</p>
        </div>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-emerald-400 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  );
};
